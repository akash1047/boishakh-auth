import Application from '@/lib/core/Application';
import DevApplication from '@/lib/core/DevApplication';

const isProduction = process.env.NODE_ENV === 'production';

const app = isProduction ? new Application() : new DevApplication();

export default app;
