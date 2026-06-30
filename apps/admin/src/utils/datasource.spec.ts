import { describe, it, expect, beforeEach, vi } from 'vitest';

// 使用 vi.hoisted 让 mock 工厂能引用到该函数（vi.mock 会被提升到顶层）
const { getDatasourceDataByCode } = vi.hoisted(() => ({
  getDatasourceDataByCode: vi.fn(),
}));

vi.mock('../api/form-datasource', () => ({
  getDatasourceDataByCode,
}));

import { resolveSchemaDatasources } from './datasource';

describe('resolveSchemaDatasources', () => {
  beforeEach(() => {
    getDatasourceDataByCode.mockReset();
  });

  it('schema 为空时原样返回', async () => {
    expect(await resolveSchemaDatasources(null)).toBeNull();
    expect(await resolveSchemaDatasources(undefined)).toBeUndefined();
  });

  it('schema 无 properties 时原样返回', async () => {
    const schema = { foo: 'bar' } as any;
    const result = await resolveSchemaDatasources(schema);
    expect(result).toEqual({ foo: 'bar' });
    expect(getDatasourceDataByCode).not.toHaveBeenCalled();
  });

  it('属性含 datasourceCode 时填充 enum/enumNames', async () => {
    getDatasourceDataByCode.mockResolvedValueOnce([
      { label: '男', value: 'M' },
      { label: '女', value: 'F' },
    ]);

    const schema = {
      properties: {
        gender: { type: 'string', datasourceCode: 'gender' },
      },
    } as any;

    const result = await resolveSchemaDatasources(schema);

    expect(getDatasourceDataByCode).toHaveBeenCalledWith('gender');
    expect(result.properties.gender.enum).toEqual(['M', 'F']);
    expect(result.properties.gender.enumNames).toEqual(['男', '女']);
  });

  it('不应修改原始 schema（深拷贝）', async () => {
    getDatasourceDataByCode.mockResolvedValueOnce([
      { label: 'A', value: 'a' },
    ]);

    const schema = {
      properties: {
        x: { datasourceCode: 'x' },
      },
    } as any;
    const original = JSON.parse(JSON.stringify(schema));

    await resolveSchemaDatasources(schema);

    expect(schema).toEqual(original);
  });

  it('递归处理嵌套 properties', async () => {
    getDatasourceDataByCode.mockResolvedValueOnce([
      { label: 'L1', value: 'v1' },
    ]);

    const schema = {
      properties: {
        outer: {
          type: 'object',
          properties: {
            inner: { datasourceCode: 'code-inner' },
          },
        },
      },
    } as any;

    const result = await resolveSchemaDatasources(schema);

    expect(result.properties.outer.properties.inner.enum).toEqual(['v1']);
    expect(result.properties.outer.properties.inner.enumNames).toEqual(['L1']);
  });

  it('递归处理数组 items.properties', async () => {
    getDatasourceDataByCode.mockResolvedValueOnce([
      { label: 'Tag', value: 't' },
    ]);

    const schema = {
      properties: {
        list: {
          type: 'array',
          items: {
            properties: {
              tag: { datasourceCode: 'tag' },
            },
          },
        },
      },
    } as any;

    const result = await resolveSchemaDatasources(schema);

    expect(result.properties.list.items.properties.tag.enum).toEqual(['t']);
  });

  it('相同 datasourceCode 多次使用应走缓存（API 仅调用一次）', async () => {
    getDatasourceDataByCode.mockResolvedValue([
      { label: 'Opt', value: 'o' },
    ]);

    const schema = {
      properties: {
        a: { datasourceCode: 'shared' },
        b: { datasourceCode: 'shared' },
      },
    } as any;

    const result = await resolveSchemaDatasources(schema);

    expect(getDatasourceDataByCode).toHaveBeenCalledTimes(1);
    expect(result.properties.a.enum).toEqual(['o']);
    expect(result.properties.b.enum).toEqual(['o']);
  });

  it('API 抛错时回退为空数组，不设置 enum', async () => {
    getDatasourceDataByCode.mockRejectedValueOnce(new Error('network'));

    const schema = {
      properties: {
        x: { datasourceCode: 'broken' },
      },
    } as any;

    const result = await resolveSchemaDatasources(schema);

    expect(result.properties.x.enum).toBeUndefined();
    expect(result.properties.x.enumNames).toBeUndefined();
  });

  it('数据源返回空数组时不设置 enum', async () => {
    getDatasourceDataByCode.mockResolvedValueOnce([]);

    const schema = {
      properties: {
        x: { datasourceCode: 'empty' },
      },
    } as any;

    const result = await resolveSchemaDatasources(schema);

    expect(result.properties.x.enum).toBeUndefined();
  });

  it('无 datasourceCode 的属性保持不变', async () => {
    const schema = {
      properties: {
        name: { type: 'string', title: '姓名' },
      },
    } as any;

    const result = await resolveSchemaDatasources(schema);

    expect(result.properties.name).toEqual({ type: 'string', title: '姓名' });
    expect(getDatasourceDataByCode).not.toHaveBeenCalled();
  });
});
