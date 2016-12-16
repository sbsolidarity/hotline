set :stage, :production

server ENV.fetch('SERVER', 'sbsolidarity.org'),
       user: ENV.fetch('DEPLOY_USER', 'snake'),
       roles: [:web, :app]
set :ssh_options, port: 22, keys: ['~/.ssh/id_rsa']
