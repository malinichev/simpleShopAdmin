module.exports = {
  deploy: {
    production: {
      user: 'deploy',
      host: '194.156.116.142',
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
