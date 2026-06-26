/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDatasourceDataByCode } from '../api/form-datasource';

/**
 * 解析 schema 中的数据源配置，从 API 加载选项数据并注入到 schema 中
 * 选择类组件（select/radio/multiSelect/checkboxes）如果有 datasourceCode 属性，
 * 则从数据源加载数据填充到 enum/enumNames
 */
export async function resolveSchemaDatasources(schema: any): Promise<any> {
  if (!schema || !schema.properties) return schema;

  const newSchema = JSON.parse(JSON.stringify(schema));
  const datasourceCache: Record<string, any[]> = {};

  const resolveProperty = async (props: any) => {
    for (const key of Object.keys(props)) {
      const prop = props[key];

      // 如果有数据源编码，加载选项
      if (prop.datasourceCode) {
        const code = prop.datasourceCode;
        if (!datasourceCache[code]) {
          try {
            datasourceCache[code] = await getDatasourceDataByCode(code);
          } catch {
            datasourceCache[code] = [];
          }
        }
        const options = datasourceCache[code];
        if (options.length > 0) {
          prop.enum = options.map((o: any) => o.value);
          prop.enumNames = options.map((o: any) => o.label);
        }
      }

      // 递归处理对象类型的子属性
      if (prop.properties) {
        await resolveProperty(prop.properties);
      }

      // 递归处理数组类型的 items
      if (prop.items && prop.items.properties) {
        await resolveProperty(prop.items.properties);
      }
    }
  };

  await resolveProperty(newSchema.properties);
  return newSchema;
}
