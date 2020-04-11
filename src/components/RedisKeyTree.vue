<template>
  <div>
    <a-button type="primary" @click="refreshTree">Reload</a-button>
    <a-directory-tree :treeData="treeData" @select="onSelect" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      treeData: []
    };
  },
  methods: {
    formatTree(root, prefix = "") {
      return Object.keys(root).map(x => {
        const children = this.formatTree(root[x], `${prefix}${x}:`);
        const isLeaf = children.length === 0;
        const title = isLeaf ? `${prefix}${x}` : x.length > 0 ? x : " ";
        return {
          title,
          key: `${isLeaf ? "-" : "+"}${prefix}${x}`,
          isLeaf,
          children
        };
      });
    },
    async refreshTree() {
      const tree = await this.$redis.getKeyTree();
      this.treeData = this.formatTree(tree);
    },
    async onSelect(keys) {
      const name = keys[0];
      // only leaf
      if (name[0] === "-") {
        const key = name.substr(1);
        const detail = await this.$redis.detail(key);
        console.log(`select ${key}, detail=`, detail);
        this.$redis.eventEmit("select-key", detail);
      }
    },
  },
  async created() {
    await this.$redis.connect("localhost");
  }
};
</script>