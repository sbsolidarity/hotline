set :application, 'SBS'
set :repo_url, ENV.fetch('REPO', 'https://gitlab.com/welp/solidarity.git')
set :branch, ENV.fetch('BRANCH', 'master')

set :deploy_to, '/var/www'

set :linked_dirs, %w[public/audio]
set :linked_files,
    %w[
      config/application.json
      config/google.json
      config/lang.json
      config/responders.json
      config/twilio.json
    ]

set :stages, %w[production]
set :default_stage, 'production'

set :log_level, :debug

set :keep_releases, 20
