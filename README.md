# Discourse Rocket.Chat

This plugin integrates [Rocket.Chat](https://rocket.chat/) with Discourse.
The plugin has been created by [Communiteq](https://www.communiteq.com/).

The integration consists of two parts:
- Embedding of the chat within the Discourse user interface
- Single sign on between Discourse and Rocket.Chat, where Discourse acts as an authentication provider to authenticate, create and update users in Rocket.Chat. 

## How to Install this Plugin

To install the plugin see https://meta.discourse.org/t/install-a-plugin/19157

## Plugin Configuration

The integration needs to be configured on both systems. Discourse needs to know where to find the chat in order to integrate it in its user interface, and Rocket.Chat needs to know where to find Discourse in order to be able to authenticate.

### Discourse side

#### Admin - Plugins - Discourse RocketChat - Settings

`discourse_rocketchat_enabled`
Enable or disable the plugin.

`discourse rocketchat title`
Configure the title of the chat window here, e.g. `Chat`

`discourse rocketchat host`
Configure the host name of your RocketChat instance, e.g. `chat.example.com`.
Do not prefix this with `https://` or so.

`discourse rocketchat default channel`
Configure the default channel here, e.g. `General`.

`discourse rocketchat min trust level`
Configure the minimum trust level for your users in order to be able to use Rocket.Chat, e.g. `2: member`.

`discourse rocketchat click entire bar`
Enable this if you want the entire title bar to be clickable to expand or hide the chat. Disable this if you only want the 'Open' and 'Close' text to be clickable.

`discourse rocketchat show menu for groups`
Configure the groups for which you want Rocket.Chat to show its menu, e.g. `staff`

### Rocket.Chat side

#### Administration - Settings - CAS

The integration uses the CAS 2.0 protocol for authentication and authorization.

Replace `forum.example.com` with the name of your forum.

* **SSO Base URL**: `https://forum.example.com/rocketchat`
* **SSO Login URL**: `https://forum.example.com/rocketchat/login`
* **CAS Version**: 2.0
* **Trust CAS username**: enabled
* **Allow user creation**: enabled
* **Enabled**: enabled

#### Administration - Settings - CAS - Attribute Handling

In order to be able to synchronize the email address and full name, we need to configure where those attributes can be found.

* **Always Sync User Data**: enabled
* **Attribute Map**: `{"email":"%email%", "name":"%name%"}`

#### Administration - Settings - General

We need to be able to run Rocket.Chat in an iFrame.

* **Restrict access inside any Iframe**: disabled

#### Administration - Settings - Accounts

In order to integrate the two platforms, Discourse must have control over the login and registration and the full name, name and email address of the account. You need to disable the following settings on Rocket.Chat side:

* **Allow User Avatar Change**: disabled
* **Allow Name Change**: disabled
* **Allow Username Change**: disabled
* **Allow Email Change**: disabled
* **Show Default Login Form**: disabled

#### Administration - Settings - Accounts - Registration

* **Registration Form**: disabled
* **Registration Form Secret URL**: *(some random string)*
#### Administration - Settings - Accounts - Avatar

Rocket.Chat can use Discourse's avatars.
Make sure to replace `forum.example.com` with the name of your forum.

* **Avatar External Provider URL**: `https://forum.example.com/rocketchat/avatar/{username}.png`

