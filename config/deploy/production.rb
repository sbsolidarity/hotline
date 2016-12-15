set :stage, :production

server ENV.fetch('SERVER', 'sbsolidarity.org'),
       user: 'snake',
       roles: [:web, :app]
set :ssh_options, port: 22, keys: ['~/.ssh/id_rsa']
