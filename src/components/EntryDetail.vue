<template>
  <div>
    <a-card :title="key" size="small">
      <a-row type="flex">
        <a-col :span="12">
          <b>[TYPE]</b>
          {{type}}
        </a-col>
        <a-col :span="12">
          <b>[TTL]</b>
          {{ttl}}
        </a-col>
      </a-row>
      <br />
      <a-table size="middle" :columns="columns" :dataSource="data" />
    </a-card>
  </div>
</template>
<script>
const stringColumns = [
  {
    title: "Value",
    dataIndex: "value"
  }
];

const listColumns = [
  {
    title: "Value",
    dataIndex: "value"
  }
];

const setColumns = [
  {
    title: "Value",
    dataIndex: "value"
  }
];

const hashColumns = [
  {
    title: "Field",
    dataIndex: "field"
  },
  {
    title: "Value",
    dataIndex: "value"
  }
];

const zsetColumns = [
  {
    title: "Member",
    dataIndex: "member"
  },
  {
    title: "Score",
    dataIndex: "score"
  }
];

export default {
  data() {
    return {
      key: "",
      ttl: "",
      type: "",
      data: [],
      columns: []
    };
  },
  methods: {
    handleDetail(detail) {
      this.type = detail.type;
      this.key = detail.key;
      this.ttl = detail.ttl;
      switch (this.type) {
        case "string": {
          this.data = [
            {
              key: "value",
              value: detail.string.value
            }
          ];
          this.columns = stringColumns;
          break;
        }
        case "list": {
          this.data = detail.list.slice.map((x, i) => {
            return {
              key: i,
              value: x
            };
          });
          this.columns = listColumns;
          break;
        }
        case "set": {
          this.data = detail.set.slice.map((x, i) => {
            return {
              key: i,
              value: x
            };
          });
          this.columns = setColumns;
          break;
        }
        case "hash": {
          this.data = detail.hash.slice.map((x, i) => {
            x.key = i;
            return x;
          });
          this.columns = hashColumns;
          break;
        }
        case "zset": {
          this.data = detail.zset.slice.map((x, i) => {
            x.key = i;
            return x;
          });
          this.columns = zsetColumns;
          break;
        }
      }
    }
  },
  created() {
    this.$redis.eventOffAll("select-key");
    this.$redis.eventOn("select-key", detail => {
      console.log("[event] [select-key]", detail);
      this.handleDetail(detail);
    });
  }
};
</script>
