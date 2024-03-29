import { Injectable } from '@nestjs/common';
import { UserDto } from '../sign/dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SignService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async sign_up(user: UserDto) {
    const findUser = await this.userModel.findOne({
      name: user.name,
    });
    if (findUser)
      return {
        status: 404,
        message: `Name '${user.name}' 가 이미 존재합니다.`,
      };

    try {
      const newUser = new this.userModel(user);
      console.log(newUser.name);
      await newUser.save();
      return { status: 200, data: newUser };
    } catch (error) {
      throw error;
    }
  }

  async sign_in(user: UserDto) {
    const findUser = await this.userModel.findOne({ name: user.name });
    if (!findUser) return { status: 401 };

    const accessToken = this.jwtService.sign({
      name: findUser.name,
    });
    return { status: 200, accessToken };
  }

  async sign_out(user: UserDto) {
    const findUser = await this.userModel.findOne({ name: user.name });
    if (!findUser) {
      return { status: 401, message: '사용자를 찾지 못했습니다.' };
    }

    await this.userModel.updateOne(
      { name: user.name },
      { $set: { invalidatedToken: true } },
    );

    return { status: 200, message: '로그아웃 되었습니다.' };
  }
}
