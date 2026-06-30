export interface MenuTreeNode {
  id: string;
  parentId: string | null;
  children?: MenuTreeNode[];
  [key: string]: unknown;
}

/**
 * 将扁平的菜单列表构建为树形结构。
 * - 父节点不在列表中的节点视为根节点
 * - 没有子节点的节点不含 children 字段
 * @param menus 扁平菜单列表
 */
export function buildMenuTree<T extends MenuTreeNode>(menus: T[]): T[] {
  const map = new Map<string, T>();
  const roots: T[] = [];

  menus.forEach((m) => {
    map.set(m.id, { ...m, children: [] as T[] });
  });

  menus.forEach((m) => {
    const node = map.get(m.id)!;
    if (m.parentId && map.has(m.parentId)) {
      (map.get(m.parentId)!.children as T[]).push(node);
    } else {
      roots.push(node);
    }
  });

  const clean = (nodes: T[]) => {
    nodes.forEach((n) => {
      const children = n.children as T[];
      if (!children || children.length === 0) {
        delete n.children;
      } else {
        clean(children);
      }
    });
  };
  clean(roots);

  return roots;
}
