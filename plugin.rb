# name: discourse-rocketchat
# about: Discourse RocketChat integration plugin
# version: 1.0
# authors: richard@communiteq.com
# url: https://www.communiteq.com/

enabled_site_setting :discourse_rocketchat_enabled

PLUGIN_NAME ||= "discourse-rocketchat".freeze

register_asset 'stylesheets/common/rocketchat.scss'
register_asset 'stylesheets/desktop/rocketchat.scss', :desktop
register_asset 'stylesheets/mobile/rocketchat.scss', :mobile

register_svg_icon "fab-rocketchat" if respond_to?(:register_svg_icon)

after_initialize do
  module ::DiscourseRocketchat
    class Engine < ::Rails::Engine
      engine_name PLUGIN_NAME
      isolate_namespace DiscourseRocketchat
    end
  end

  require_dependency "application_controller"

  class DiscourseRocketchat::AvatarController < ::ApplicationController
    requires_plugin PLUGIN_NAME

    def avatar
      user = User.find_by(username_lower: params[:username].downcase)
      if user
        return redirect_to Discourse.base_url + user.avatar_template.sub('{size}','200') 
      else
        return redirect_to Discourse.base_url + '/images/avatar.png'
      end
    end
  end

  class DiscourseRocketchat::AuthController < ::ApplicationController
    requires_plugin PLUGIN_NAME

    def login
      params.require(:service)
      service = params[:service]

      hostname = URI.parse(service).host
      if SiteSetting.discourse_rocketchat_host != hostname
        render plain: "Unable to authenticate against #{hostname}. #{SiteSetting.discourse_rocketchat_host} Please configure it in discourse_rocketchat_host.", status: 422
        return
      end

      if current_user
        if current_user.trust_level >= SiteSetting.discourse_rocketchat_min_trust_level
          ticket = SecureRandom.hex(16)
          info = {
            service: service,
            username: current_user.username,
            name: current_user.name || current_user.username,
            email: current_user.email
          }
          Discourse.redis.setex("cas_#{ticket}", 600, info.to_json)
          redirect_to "#{params[:service]}?ticket=#{ticket}"
        else
          render plain: "You need to be on trust level #{SiteSetting.discourse_rocketchat_min_trust_level} or higher to use the chat. Please contact your community manager.", status: 403
          return
        end
      else # not logged in
        cookies[:cas_payload] = request.query_string
        redirect_to path('/login')
      end
    end

    def proxy_validate
      params.require(:service)
      params.require(:ticket)

      service = params[:service]
      ticket = params[:ticket]

      info = JSON.parse Discourse.redis.get("cas_#{ticket}")
      if info.nil?
        render plain: "ticket not found", status: 404
        return
      end

      if info['service'] != service
        render plain: "service parameter does not match the ticket info", status: 422
        return
      end

      Discourse.redis.del("cas_#{ticket}")

      response = %{
        <cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>
          <cas:authenticationSuccess>
            <cas:user>#{info['username']}</cas:user>
            <cas:attributes>
              <cas:name>#{info['name']}</cas:name>
              <cas:username>#{info['username']}</cas:username>
              <cas:email>#{info['email']}</cas:email>
            </cas:attributes>
          </cas:authenticationSuccess>
        </cas:serviceResponse>
      }
      render :xml => response
    end
  end

  DiscourseRocketchat::Engine.routes.draw do
    get "/login", to: "auth#login", defaults: { format: :json }
    get "/proxyValidate", to: "auth#proxy_validate", defaults: { format: :json }
    get '/avatar/:username.png' => 'avatar#avatar', defaults: { format: :json }
  end

  Discourse::Application.routes.append do
    mount ::DiscourseRocketchat::Engine, at: "/rocketchat"
  end

  module ::PatchSessionController
    def login(user)
      if payload = cookies.delete(:cas_payload)
        # we need to copy a few lines from the original method since we cannot monkey patch in the middle :(
        # https://github.com/discourse/discourse/blob/master/app/controllers/session_controller.rb#L603-L606
        session.delete(::SessionController::ACTIVATE_USER_KEY)
        user.update_timezone_if_missing(params[:timezone])
        log_on_user(user)

        if request.xhr? # set cookie so js will act upon it, prevents CORS issues
          cookies[:sso_destination_url] = "/rocketchat/login?#{payload}"
        else
          redirect_to "/rocketchat/login?#{payload}"
        end
      else
        super
      end
    end
  end

  class ::SessionController
    prepend PatchSessionController
  end
end
