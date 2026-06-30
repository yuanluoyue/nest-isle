import { buildMenuTree, MenuTreeNode } from './menu-tree.util';

describe('buildMenuTree', () => {
  it('空列表返回空数组', () => {
    expect(buildMenuTree([])).toEqual([]);
  });

  it('单节点（无 parentId）作为根返回', () => {
    const nodes: MenuTreeNode[] = [{ id: '1', parentId: null, name: 'root' }];
    const tree = buildMenuTree(nodes);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('1');
    expect(tree[0].children).toBeUndefined();
  });

  it('应正确构建多级父子树', () => {
    const nodes: MenuTreeNode[] = [
      { id: '1', parentId: null, name: 'dashboard' },
      { id: '2', parentId: '1', name: 'analysis' },
      { id: '3', parentId: '1', name: 'monitor' },
      { id: '4', parentId: '3', name: 'sessions' },
    ];

    const tree = buildMenuTree(nodes);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('1');
    expect(tree[0].children).toHaveLength(2);
    expect(tree[0].children![0].id).toBe('2');
    expect(tree[0].children![1].id).toBe('3');
    expect(tree[0].children![1].children).toHaveLength(1);
    expect(tree[0].children![1].children![0].id).toBe('4');
  });

  it('叶子节点不应包含 children 字段', () => {
    const nodes: MenuTreeNode[] = [
      { id: '1', parentId: null, name: 'root' },
      { id: '2', parentId: '1', name: 'child' },
    ];

    const tree = buildMenuTree(nodes);

    expect(tree[0].children).toBeDefined();
    expect(tree[0].children![0].children).toBeUndefined();
  });

  it('parentId 指向不存在节点时视为根', () => {
    const nodes: MenuTreeNode[] = [
      { id: '1', parentId: '999', name: 'orphan' },
      { id: '2', parentId: null, name: 'root' },
    ];

    const tree = buildMenuTree(nodes);

    expect(tree).toHaveLength(2);
    const ids = tree.map((n) => n.id).sort();
    expect(ids).toEqual(['1', '2']);
  });

  it('不应修改原始数组中的对象（不可变）', () => {
    const nodes: MenuTreeNode[] = [
      { id: '1', parentId: null, name: 'root' },
      { id: '2', parentId: '1', name: 'child' },
    ];
    const original = JSON.stringify(nodes);

    buildMenuTree(nodes);

    expect(JSON.stringify(nodes)).toBe(original);
  });

  it('保留节点上的其他字段', () => {
    const nodes: MenuTreeNode[] = [
      {
        id: '1',
        parentId: null,
        name: 'root',
        path: '/root',
        permission: null,
        sort: 1,
      },
    ];

    const [root] = buildMenuTree(nodes);

    expect(root.name).toBe('root');
    expect(root.path).toBe('/root');
    expect(root.sort).toBe(1);
    expect(root.permission).toBeNull();
  });
});
