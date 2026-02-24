module.exports = {
  deploy: {
    production: {
      user: 'deploy',
      host: '45.81.243.129',
      ref: 'origin/main',
      repo: 'git@github-admin:malinichev/simpleShopAdmin.git',
      path: '/var/www/simple-shop-admin',
      'pre-deploy-local': '',
      'post-deploy':
        'printf "VITE_API_URL=http://45.81.243.129:4000/api\\nVITE_APP_NAME=SportShop Admin\\n" > .env.production && pnpm install --frozen-lockfile && pnpm run build',
      'pre-setup': '',
    },
  },
};
