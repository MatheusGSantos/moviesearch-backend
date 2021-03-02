import { Request, Response } from 'express';
import { container } from 'tsyringe';

import ResetPasswordService from '@modules/users/services/ResetPasswordService';

export default class ResetPasswordController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { password, token } = request.body;

    try {
      const resetPasswordService = container.resolve(ResetPasswordService);

      await resetPasswordService.execute({
        token,
        password,
      });
    } catch (err) {
      console.log(err);
    }

    return response.status(204).json();
  }
}
