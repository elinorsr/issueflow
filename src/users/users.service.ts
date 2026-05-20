import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const exists = await this.usersRepo.findOne({
      where: [{ username: dto.username }, { email: dto.email }],
    });
    if (exists) throw new ConflictException('Username or email already taken');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({ ...dto, password: hashed });
    const saved = await this.usersRepo.save(user);
    return this.strip(saved);
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepo.find();
    return users.map(this.strip);
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return this.strip(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { username } });
  }

  async findByUsernameInsensitive(username: string): Promise<User | null> {
    return this.usersRepo
      .createQueryBuilder('u')
      .where('LOWER(u.username) = LOWER(:username)', { username })
      .getOne();
  }

  async update(id: number, dto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    Object.assign(user, dto);
    const saved = await this.usersRepo.save(user);
    return this.strip(saved);
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    await this.usersRepo.remove(user);
  }

  private strip(user: User): Omit<User, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest as Omit<User, 'password'>;
  }
}
