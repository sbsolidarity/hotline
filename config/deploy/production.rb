set :stage, :production

server ENV.fetch('SERVER'),
       user: ENV.fetch('DEPLOY_USER', 'deploy'),
       roles: [:web, :app]
set :ssh_options, port: 22, keys: ['~/.ssh/id_rsa']
