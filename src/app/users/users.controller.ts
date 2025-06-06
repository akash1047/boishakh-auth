import { Request, Response } from 'express';
import UsersService from './users.service';

export default class UsersController {
  constructor(private userService = new UsersService()) {}

  getAllUsers = async (_: Request, res: Response) => {
    const users = await this.userService.getAllUsers();
    res.status(200).json(users);
  };

  createUserWithPassword = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await this.userService.createUserWithPassword({
      email,
      password,
    });
    res.status(201).json(user);
  };
}
