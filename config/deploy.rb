lock '3.4.0'

set :application, 'response-network-router'
set :scm, :git
set :repo_url, ENV.fetch('REPO', 'https://gitlab.com/welp/solidarity.git')
set :branch, ENV.fetch('BRANCH', 'master')

set :deploy_to, '/var/www'
set :linked_files,
    %w(
      config/application.json
      config/google.json
      config/twilio.json
    )

set :linked_dirs, %w(.well-known)

set :stages, %w(production)
set :default_stage, 'production'

set :log_level, :debug

set :keep_releases, 20
