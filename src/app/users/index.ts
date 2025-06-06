import UsersController from '@/app/users/users.controller';
import { Router } from 'express';
import { validateUserEmailAndPassword } from './users.middleware';

export default class UsersModule {
  public router: Router;
  private usersController: UsersController;

  constructor() {
    this.router = Router();
    this.usersController = new UsersController();
  }

  getRouter() {
    this.router.get('/', this.usersController.getAllUsers);
    this.router.post(
      '/',
      validateUserEmailAndPassword,
      this.usersController.createUserWithPassword
    );

    return this.router;
  }
}
