import app from '@/app';

const config = {
  port: parseInt(process.env.PORT ?? '8080', 10),
};

app.run(config);
