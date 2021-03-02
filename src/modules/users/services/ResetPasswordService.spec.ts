import AppError from '@shared/error/AppError';

import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository';
import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider';
import FakeUserTokensRepository from '../repositories/fakes/FakeUserTokensRepository';

import ResetPasswordService from './ResetPasswordService';

let fakeUsersRepository: FakeUsersRepository;
let fakeHashProvider: FakeHashProvider;
let fakeUserTokensRepository: FakeUserTokensRepository;
let resetPasswordService: ResetPasswordService;

describe('ResetPasswordService', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeHashProvider = new FakeHashProvider();
    fakeUserTokensRepository = new FakeUserTokensRepository();
    resetPasswordService = new ResetPasswordService(
      fakeUsersRepository,
      fakeUserTokensRepository,
      fakeHashProvider,
    );
  });

  it('Should be able to reset the password', async () => {
    const user = await fakeUsersRepository.create({
      name: 'name',
      email: '12345@gmail.com',
      password: '12345',
    });

    const { token } = await fakeUserTokensRepository.generate(user.id);

    const generatedHash = jest.spyOn(fakeHashProvider, 'generateHash');

    await resetPasswordService.execute({
      password: '54321',
      token,
    });

    const updatedUser = await fakeUsersRepository.findById(user.id);

    expect(generatedHash).toBeCalledWith('54321');
    expect(updatedUser?.password).toBe('54321');
  });

  it('Should not be able to change a password without a token', async () => {
    expect(
      resetPasswordService.execute({
        password: '54321',
        token: 'token',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('Should not be able to change the password of a non-existing user', async () => {
    const { token } = await fakeUserTokensRepository.generate('fake-user-id');

    expect(
      resetPasswordService.execute({
        password: '54321',
        token,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('Should not be able to change the password with a expired token', async () => {
    const user = await fakeUsersRepository.create({
      name: 'name',
      email: '12345@gmail.com',
      password: '12345',
    });

    const { token } = await fakeUserTokensRepository.generate(user.id);

    await resetPasswordService.execute({
      password: '54321',
      token,
    });

    jest.spyOn(Date, 'now').mockImplementation(() => {
      const customDate = new Date();

      return customDate.setHours(customDate.getHours() + 3);
    });

    await expect(
      resetPasswordService.execute({
        password: '54321',
        token,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
