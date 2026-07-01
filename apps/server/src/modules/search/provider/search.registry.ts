import { Injectable } from '@nestjs/common';
import { SearchProvider } from './provider.interface';

@Injectable()
export class SearchRegistry {
  private providers: Map<string, SearchProvider> = new Map();

  register(provider: SearchProvider) {
    this.providers.set(provider.name, provider);
  }

  getProviders(): SearchProvider[] {
    return Array.from(this.providers.values());
  }

  getProvider(name: string): SearchProvider | undefined {
    return this.providers.get(name);
  }
}
