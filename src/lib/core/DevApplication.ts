import dotenv from 'dotenv';
import Application, { Config } from './Application';

export default class DevApplication extends Application {
  run(config: Config) {
    dotenv.config();
    super.run(config);
  }
}
