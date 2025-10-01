# Deployment Guide

This guide will help you deploy the Crisp Interview Assistant to various platforms.

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Git installed
- Account on deployment platform (Vercel/Netlify)

## Building for Production

Before deploying, build the application:

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Deploy to Vercel

### Method 1: Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

### Method 2: Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
6. Click "Deploy"

## Deploy to Netlify

### Method 1: Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Initialize and deploy:
```bash
netlify init
netlify deploy --prod
```

### Method 2: Netlify Dashboard

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Click "Deploy site"

### Method 3: Drag and Drop

1. Build the project locally:
```bash
npm run build
```

2. Go to [netlify.com/drop](https://app.netlify.com/drop)
3. Drag and drop the `build` folder

## Environment Variables

If you add environment variables in the future (e.g., API keys), configure them in your deployment platform:

### Vercel
```bash
vercel env add REACT_APP_API_KEY
```

### Netlify
Go to Site settings → Build & deploy → Environment → Environment variables

## Custom Domain

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Netlify
1. Go to Site settings → Domain management
2. Add custom domain
3. Configure DNS records as instructed

## Continuous Deployment

Both Vercel and Netlify support automatic deployments:

1. Connect your GitHub repository
2. Every push to the main branch triggers a new deployment
3. Pull requests get preview deployments

## Post-Deployment Checklist

- [ ] Test all pages and features
- [ ] Verify resume upload works
- [ ] Test interview flow end-to-end
- [ ] Check dashboard functionality
- [ ] Test on mobile devices
- [ ] Verify data persistence
- [ ] Check console for errors
- [ ] Test in different browsers

## Troubleshooting

### Build Fails

1. Check Node.js version (should be 16+)
2. Clear cache: `npm cache clean --force`
3. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
4. Check for TypeScript errors: `npm run build`

### Runtime Errors

1. Check browser console for errors
2. Verify all environment variables are set
3. Check network tab for failed API calls
4. Clear browser cache and localStorage

### Performance Issues

1. Enable gzip compression
2. Configure CDN caching
3. Optimize images
4. Enable lazy loading

## Monitoring

### Vercel Analytics
Enable in Project Settings → Analytics

### Netlify Analytics
Enable in Site settings → Analytics

## Support

For deployment issues:
- Vercel: [vercel.com/support](https://vercel.com/support)
- Netlify: [netlify.com/support](https://netlify.com/support)
