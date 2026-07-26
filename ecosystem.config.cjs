// GENERATED from deploy/templates/ecosystem/admin.config.cjs.template
// Do not edit manually. Run `cd deploy && pnpm run generate` after editing the template or .env.deploy.

module.exports = {
  apps: [
    {
      name: 'simple-shop-admin',
      script: 'npx',
      args: 'serve -s dist -l 3001',
      cwd: '/var/www/simple-shop-admin/current',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/www/simple-shop-admin/logs/error.log',
      out_file: '/var/www/simple-shop-admin/logs/out.log',
      merge_logs: true,
      max_restarts: 10,
      restart_delay: 3000,
      watch: false,
    },
  ],

  deploy: {
    production: {
      user: 'root',
      host: '186.246.48.216',
      ref: 'origin/main',
      repo: 'git@github-admin:malinichev/simpleShopAdmin.git',
      path: '/var/www/simple-shop-admin',
      'pre-deploy-local': '',
      'post-deploy':
        'ln -sf /var/www/simple-shop-admin/.env.production .env.production && pnpm install --frozen-lockfile && pnpm run build',
      'pre-setup': 'mkdir -p /var/www/simple-shop-admin/logs',
    },
  },
};
