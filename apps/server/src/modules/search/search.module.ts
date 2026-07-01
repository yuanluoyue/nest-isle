import { Module, OnModuleInit } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '../../core/auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchRegistry } from './provider/search.registry';
import { SearchHistoryService } from './history/search-history.service';
import { MenuProvider } from './provider/menu.provider';
import { UserProvider } from './provider/user.provider';
import { FormProvider } from './provider/form.provider';
import { PromptProvider } from './provider/prompt.provider';

@Module({
  imports: [CoreAuthModule, DatabaseModule],
  controllers: [SearchController],
  providers: [
    SearchRegistry,
    SearchHistoryService,
    SearchService,
    MenuProvider,
    UserProvider,
    FormProvider,
    PromptProvider,
  ],
  exports: [SearchService],
})
export class SearchModule implements OnModuleInit {
  constructor(
    private searchRegistry: SearchRegistry,
    private menuProvider: MenuProvider,
    private userProvider: UserProvider,
    private formProvider: FormProvider,
    private promptProvider: PromptProvider,
  ) {}

  onModuleInit() {
    this.searchRegistry.register(this.menuProvider);
    this.searchRegistry.register(this.userProvider);
    this.searchRegistry.register(this.formProvider);
    this.searchRegistry.register(this.promptProvider);
  }
}
