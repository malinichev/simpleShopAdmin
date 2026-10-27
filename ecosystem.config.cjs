// GENERATED from deploy/templates/ecosystem/admin.config.cjs.template
// Do not edit manually. Run `cd deploy && pnpm run generate` after editing the template or .env.deploy.

module.exports = {
  deploy: {
    production: {
      user: 'deploy',
      host: '186.246.48.216',
      ref: 'origin/main',
      repo: 'git@github-admin:malinichev/simpleShopAdmin.git',
      path: '/var/www/simple-shop-admin',
      'pre-deploy-local': '',
      'post-deploy':
        'ln -sf /var/www/simple-shop-admin/.env.production .env.production && pnpm install --frozen-lockfile && pnpm run build',
      'pre-setup': '',
    },
  },
};
