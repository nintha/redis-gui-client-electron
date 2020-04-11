import Vue from 'vue';
import Antd  from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import App from './App';
import { remote } from 'electron';

Vue.use(Antd);
Vue.redis = Vue.prototype.$redis = remote.app.redis
Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');