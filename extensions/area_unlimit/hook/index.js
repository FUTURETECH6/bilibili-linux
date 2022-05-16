console.log("index")
const HTTP = {
  get(url) {
    return new Promise((resolve, reject) => {
      const Http = new XMLHttpRequest()
      Http.open('GET', url)
      Http.send()
      Http.onloadend = e => {
        resolve(e)
      }
      Http.onerror = e => reject
    })
  }
}
const _historyWrap = function (type) {
  const orig = history[type];
  const e = new Event(type);
  return function () {
    const rv = orig.apply(this, arguments);
    e.arguments = arguments;
    window.dispatchEvent(e);
    return rv;
  };
};
history.pushState = _historyWrap('pushState');
history.replaceState = _historyWrap('replaceState');

function switchPage(hash) {
  // 菜单切换
  const menuDiv = document.querySelector("#app > div > div > div.app_layout--content.flex_col > div > div.app_settings.i_page_wrapper > div.header_slot.flex_start.drag")
  for (let h3 of menuDiv.children) {
    h3.style.cssText = h3.dataset.hash === hash ? "color:black!important" : "color:gray!important";
  }

  // 界面切换
  const appSettingDiv = document.querySelector("#app > div > div > div.app_layout--content.flex_col > div > div.app_settings.i_page_wrapper")
  let flag = false
  for (let page of appSettingDiv.children) {
    page.dataset.hash && (page.style.display = page.dataset.hash === hash ? "" : "none")
  }
}

function addAreaLimit() {
  console.log("addAreaLimit")
  const url = new URL(location.href)

  // 菜单
  const menuDiv = document.querySelector("#app > div > div > div.app_layout--content.flex_col > div > div.app_settings.i_page_wrapper > div.header_slot.flex_start.drag")
  if (menuDiv.children.length === 2) return;
  menuDiv.children[0].dataset.hash = url.hash
  const areaLimitH3 = document.createElement('h3');
  areaLimitH3.textContent = "漫游"
  areaLimitH3.dataset.hash = "#/page/areaLimit"
  areaLimitH3.style.cssText = "color:gray!important"
  areaLimitH3.classList.add(...menuDiv.children[0].classList)
  menuDiv.appendChild(areaLimitH3)
  for (let menu of menuDiv.children) {
    menu.classList.add('area_limit')
    menu.onclick = (e) => {
      console.log('click: ', e)
      switchPage(e.target.dataset.hash)
    }
  }

  // 界面
  const appSettingDiv = document.querySelector("#app > div > div > div.app_layout--content.flex_col > div > div.app_settings.i_page_wrapper")
  appSettingDiv.children[1].dataset.hash = url.hash
  const areaLimitPage = document.createElement('div')
  areaLimitPage.style.display = 'none'
  areaLimitPage.dataset.hash = "#/page/areaLimit"
  areaLimitPage.classList.add(...appSettingDiv.children[1].classList)
  appSettingDiv.appendChild(areaLimitPage);
  let vue = document.createElement('script');
  vue.src = "https://unpkg.com/vue@next";
  areaLimitPage.prepend(vue)
  let ele = document.createElement('script');
  ele.src = "https://unpkg.com/element-plus";
  areaLimitPage.prepend(ele)

  document.addEventListener('ROAMING_sendURL', async function (e) {
    // e.detail contains the transferred data (can be anything, ranging
    // from JavaScript objects to strings).
    // Do something, for example:
    console.log(e.detail);
    const roamingHTML = await HTTP.get(e.detail)
    // console.log(roamingHTML)
    areaLimitPage.innerHTML = roamingHTML.currentTarget.responseText
    let a = 0
    vue.onload = ()=>{createRoamingPage(++a)}
    ele.onload = ()=>{createRoamingPage(++a)}
  });
  document.dispatchEvent(new CustomEvent('ROAMING_getURL', {
    detail: 'RoamingPage' // Some variable from Gmail.
  }));
}

// vue
function createRoamingPage(e){
  if(e < 2)return;
  console.log('RoamingPage HTML')
  const App = {
    data() {
      return {
        message: "Hello Element Plus",
        uposList: [
          {
            value: 'none',
            label: '不替换'
          },
          {
            value: 'k3s',
            label: 'k3s(金山)'
          },
          {
            value: 'kodo',
            label: 'kodo（七牛）'
          },
          {
            value: 'cos',
            label: 'cos（腾讯）'
          },
          {
            value: 'bos',
            label: 'bos（百度）'
          },
          {
            value: 'wcs',
            label: 'wcs（网宿）'
          },
          {
            value: 'hw',
            label: 'hw（251）'
          },
        ],
        uposKey: localStorage.upos || 'none',
        serverList: {
          default: ''
        }
      };
    },
    created(){
      console.log('vue created')
      this.serverList = JSON.parse(localStorage.serverList || "{}")
    },
    methods:{
      changeUPOS: function(upos){
        console.log('upos change: ', upos)
        localStorage.upos = upos
      },
      changeServer: function(){
        console.log(this.serverList)
        localStorage.serverList = JSON.stringify(this.serverList)
      }
    }
  };
  const app = Vue.createApp(App);
  app.use(ElementPlus);
  app.mount("#roamingApp");
}
/**
 * 前提：默认页面为「推荐」
 * 操作：切换到设置
 * pushState: 有响应，但太快，需要延时处理
 * replaceState：无响应，但之后的切换都有响应且能直接取到元素
 */
window.addEventListener('pushState', function (e) {
  console.log('change pushState', e);
  if (e.arguments[0].current === "/page/settings") {
    // 延时，太快取不到页面元素
    setTimeout(addAreaLimit, 500)
  }
});
// window.addEventListener('replaceState', function (e) {
//   // console.log('change replaceState', e);
//   if(e.arguments[0].current === "/page/settings"){
//     addAreaLimit()
//   }
// });
const url = new URL(location.href)
if (url.hash === "#/page/settings") {
  addAreaLimit()
}