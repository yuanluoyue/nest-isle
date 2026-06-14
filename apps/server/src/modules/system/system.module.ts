import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { MenuModule } from './menu/menu.module';
import { DeptModule } from './dept/dept.module';
import { PostModule } from './post/post.module';
import { DictModule } from './dict/dict.module';
import { ConfigFeatureModule } from './config/config.module';
import { NoticeModule } from './notice/notice.module';

@Module({
  imports: [
    UserModule,
    RoleModule,
    MenuModule,
    DeptModule,
    PostModule,
    DictModule,
    ConfigFeatureModule,
    NoticeModule,
  ],
})
export class SystemModule {}
