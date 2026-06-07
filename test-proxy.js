import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

app.use('/api', createProxyMiddleware({
  target: 'https://admin-moderator-backend-staging.up.railway.app',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log('Sending proxy req to', proxyReq.path);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Got response', proxyRes.statusCode);
  }
}));

app.listen(9000, () => console.log('Proxy on 9000'));
