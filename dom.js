// 这个脚本用来添加dom
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Script loaded and DOM fully parsed and ready");
  // console.log("打印方法", window.electron);
  for (var name in window.electron) {
    // des += name + ":" + obj[name] + ";";
    console.log("打印：", name, window.electron[name]);
  }
  // 从preload获取的监听模板
  window.electron.ipcRenderer.on("modalData", (data) => {
    console.log("接受数据", data); // 接收数据

    // 调用刷新，取8个图片将图片按照新的url渲染
    window.electron.refresh();
  });
  // 添加复制功能
  document.querySelectorAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const img = button.previousElementSibling; // 获取相邻的 img 元素
      if (img && img.tagName === "IMG") {
        try {
          // await copyImageToClipboard(img.src); // 异步调用canvas
          let mode = await window.electron.getData("mode");
          if (mode === "local")  copyImage(img.src); // 创建临时dom
          // else if (mode === "rir") copyImageToClipboard(img.src);
          else if (mode === "rir") {
            let result = await window.electron.clipboard.copyWebImage(img.src); // 直接调用electron的api
            window.electron.showMessage(result.success ? 'success':'error' , '复制' + (result.success ? '成功' : '失败') );
          }
          else {
            window.electron.showMessage('error', '未知模式，请先以任意一种方式获取图片列表！！');
          }
          // alert("Image copied to clipboard!");
          // 直接使用这个img的dom，暂未写
        } catch (err) {
          console.error("Could not copy image: ", err);
        }
      }
    });
  });
  // 改标签功能
  document.querySelectorAll(".rename-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      console.log("你点击了改标签");
      const img = button.previousElementSibling.previousElementSibling; // 获取相邻的 img 元素

      if (img && img.tagName === "IMG") {
        console.log("打印元素", img);
        try {
          var msg = await window.electron.openRenameModel({
            src: img.src,
          });
        } catch (err) {
          console.error("Could not open modal: ", err);
        }
      }
    });
  });
  // 初始化图片
  await window.electron.refresh();
  // 加载上次的路径
  let historyPath = await window.electron.getData("scanPath");
  if (historyPath) {
    document.getElementById("file-path").innerHTML = historyPath;
  } else {
    let userInfo = await window.electron.getUser();
    // 默认windows
    document.getElementById(
      "file-path"
    ).innerHTML = `C:\\Users\\${userInfo.username}\\Pictures`;
  }

  console.log("上次的路径：", historyPath);
  // alert由来弹窗
  // alert('Hello from external script!');
  // alert(window.electron)

  // 选择文件夹的点击事件
  document
    .getElementById("select-folder")
    .addEventListener("click", async function () {
      // 这里获得一个path
      let filePath = await window.electron.openDirectory();
      filePath = filePath[0]; // 支取第一个路径进行缓存
      // console.log("查看存入路径", filePath);
      document.getElementById("file-path").innerHTML = filePath;
      await window.electron.setData("scanPath", filePath);
    });

  // 清空按钮的事件
  document.getElementById("clear-path").addEventListener("click", function () {
    document.getElementById("file-path").innerHTML = "";
  });
  // 扫描对应文件夹,进行模糊搜索
  document
    .getElementById("start-search")
    .addEventListener("click", async function () {
      // 获取路径
      let filePath = document.getElementById("file-path").innerHTML;
      // 判断路径是不是文件？？
      // 可以的话加一个检验路径是否合法
      if (filePath && (await window.electron.checkDir(filePath))) {
        // scanImagesInDirectory(path)
        let imgList = await window.electron.scanDir(filePath);
        // await window.electron.setData('imgList',imgList);
        // alert("搜索完毕");
        window.electron.showMessage("success", "搜索完毕!!!");
        window.electron.setData("mode", "local");
        // imgList.array.forEach(element => {
        //     console.log(element);
        // });
        // for (let i = 0; i < imgList?.length ?? 0; i++) {
        //   console.log(imgList[i]);
        // }
        // console.log(imgList);
      } else {
        alert("文件路径为空或者无效");
      }
    });
  // 刷新——本地刷新按钮
  document
    .getElementById("refresh-pic")
    .addEventListener("click", async function () {
      await window.electron.setData("page", 1);
      document.getElementById("page-num").innerHTML = 1;
      
      let MaxPageList = await window.electron.getData("imgList");
      let MaxPage = parseInt(MaxPageList.length / 8) + (MaxPageList.length % 8 ? 1 : 0);
      document.getElementById("all-page-num").innerHTML = MaxPage;

      await window.electron.refresh();
    });
  // 刷新——RIR刷新按钮

  document
    .getElementById("rir-refresh-pic")
    .addEventListener("click", async function () {
      await window.electron.setData("page", 1);
      document.getElementById("page-num").innerHTML = 1;
      
      let MaxPageList = await window.electron.getData("imgList");
      let MaxPage = parseInt(MaxPageList.length / 8) + (MaxPageList.length % 8 ? 1 : 0);
      document.getElementById("all-page-num").innerHTML = MaxPage;

      await window.electron.refresh();
    });
  // 翻页
  document
    .getElementById("forward")
    .addEventListener("click", async function () {
      let page = await window.electron.getData("page");
      page = Math.max(page - 1, 1);

      await window.electron.setData("page", page);
      await window.electron.refresh();
      console.log("上一页翻页完毕");
      document.getElementById("page-num").innerHTML = page;
    });
  document
    .getElementById("backward")
    .addEventListener("click", async function () {
      let page = await window.electron.getData("page");
      let MaxPageList = await window.electron.getData("imgList");
      let MaxPage =
        parseInt(MaxPageList.length / 8) + (MaxPageList.length % 8 ? 1 : 0);
      // console.log("打印数值", MaxPageList);
      page = Math.min(MaxPage, page + 1);

      await window.electron.setData("page", page);
      await window.electron.refresh();
      console.log("next pageing... ");
      document.getElementById("page-num").innerHTML = page;
    });
  document
    .getElementById("check-cache")
    .addEventListener("click", async function () {
      let store = await window.electron.getCache();
      console.log("打印当前缓存", store);
    });
  // 本地文件名称模糊 搜索按钮的事件
  document
    .getElementById("search-button")
    .addEventListener("click", async function () {
      // 获取搜索框的内容
      searchText = document.getElementById("search-input").value;
      console.log("Blur the content of the search box：", searchText);
      // 拿targetList进行模糊搜索,获得的列表写入imgList
      targetList = await window.electron.getData("targetList");
      console.log("View incoming parameters：", targetList, searchText);
      imgList = filterPictures(targetList, searchText);
      await window.electron.setData("imgList", imgList);

      let MaxPage = parseInt(imgList.length / 8) + (imgList.length % 8 ? 1 : 0);
      document.getElementById("all-page-num").innerHTML = MaxPage;
      await window.electron.refresh();
    });
  // RIR文件名称模糊 搜索按钮的事件
  // 因为和local的逻辑相同，直接修改个ID就行，交给rir-parse-button去做就好了
  document
    .getElementById("rir-search-button")
    .addEventListener("click", async function () {
      // 获取搜索框的内容
      searchText = document.getElementById("rir-search-input").value;
      console.log("Blur the content of the search box：", searchText);
      // 拿targetList进行模糊搜索,获得的列表写入imgList
      targetList = await window.electron.getData("targetList");
      console.log("View incoming parameters：", targetList, searchText);
      imgList = filterPictures(targetList, searchText);
      await window.electron.setData("imgList", imgList);

      let MaxPage = parseInt(imgList.length / 8) + (imgList.length % 8 ? 1 : 0);
      document.getElementById("all-page-num").innerHTML = MaxPage;
      await window.electron.refresh();
    });
  // RIR文件解析按钮
  document
    .getElementById("rir-parse-button")
    .addEventListener("click", async function () {
      let url = document.getElementById("rir-parse-input").value + "?timestamp=" + Date.now();
      try {
        let result = await loadModuleVariable(url)
        // console.log('xxx',result);
        result.list = result.list.map((element) => {
          return result.target + element; // ✅ 返回修改后的值
        });
        console.log('xxx',result.list);
        await window.electron.setData("targetList", result.list);
        await window.electron.setData("imgList", result.list);
        await window.electron.refresh();
        // 更新文本
        document.getElementById("rir-file-path").innerHTML = result.target;
        window.electron.setData("mode", "rir");
        // 更新总页数
        let MaxPageList = await window.electron.getData("imgList");
        let MaxPage = parseInt(MaxPageList.length / 8) + (MaxPageList.length % 8 ? 1 : 0);
        document.getElementById("all-page-num").innerHTML = MaxPage;
      } catch (error) {
        console.error("Could not open modal: ", error);
      }
    });
  // 函数区
});
// 复制到粘贴板
// async function copyImageToClipboard(imageUrl) {
//     const response = await fetch(imageUrl);
//     const contentType = response.headers.get('Content-Type') || 'image/png'; // 默认使用 PNG 作为回退
//     console.log('查看类型', contentType);

//     // 检查是否是支持的图像类型
//     const isSupportedImageType = contentType.startsWith('image/');
//     if (!isSupportedImageType) {
//         throw new Error('Unsupported image type');
//     }

//     const blob = await response.blob();

//     // 确保将 blob 的类型设置为 image/jpeg
//     const item = new ClipboardItem({ 'image/jpeg': blob });

//     // 写入剪贴板
//     await navigator.clipboard.write([item]);
// }
// 通过 Canvas，我们可以将图像绘制到画布上，然后将其转换为支持的格式（如 PNG），这样就能顺利地复制到剪贴板。
async function copyImageToClipboard(imageUrl) {
  const response = await fetch(imageUrl);
  const contentType = response.headers.get("Content-Type") || "image/png";
  const isSupportedImageType = contentType.startsWith("image/");
  if (!isSupportedImageType) {
    throw new Error("Unsupported image type");
  }

  const blob = await response.blob(); // 获取图像的 Blob 对象

  const imgElement = new Image(); // 创建 Image 对象
  imgElement.src = URL.createObjectURL(blob); // 将 Blob 转为 URL

  return new Promise((resolve, reject) => {
    imgElement.onload = async () => {
      const canvas = document.createElement("canvas"); // 创建 Canvas
      const ctx = canvas.getContext("2d"); // 获取 Canvas 上下文

      if (contentType === "image/gif") {
        // 处理 GIF，直接使用 GIF Blob
        const item = new ClipboardItem({ "image/gif": blob }); // 使用 GIF 格式
        await navigator.clipboard.write([item]); // 写入剪贴板
        resolve();
      } else {
        // 处理 JPG/JPEG/PNG，转换为 PNG
        canvas.width = imgElement.width; // 设置宽度
        canvas.height = imgElement.height; // 设置高度
        ctx.drawImage(imgElement, 0, 0); // 将图像绘制到 Canvas

        // 转换为 Blob，使用 'image/png' 作为 MIME 类型
        canvas.toBlob(async (newBlob) => {
          const item = new ClipboardItem({ "image/png": newBlob }); // 使用 PNG 格式
          await navigator.clipboard.write([item]); // 写入剪贴板
          resolve(); // Promise 成功
        }, "image/png");
      }
    };

    imgElement.onerror = reject; // 处理错误
  });
}
// 拷贝任何图片到粘贴板上
function copyImage(imgUrl) {
  // 创建一个img的dom，用来承载图片
  // 创建 img 元素并设置 src 属性
  const tempImg = document.createElement("img");
  tempImg.crossOrigin = "Anonymous"; // 允许跨域
  tempImg.src = imgUrl;
  console.log("打印地址", tempImg.src);
  // 将 div 添加到 document
  document.body.appendChild(tempImg);

  // 选择 div 中的内容
  const range = document.createRange();
  range.selectNode(tempImg);
  window.getSelection().removeAllRanges(); // 清除现有的选择
  window.getSelection().addRange(range);

  // 执行复制命令
  document.execCommand("copy");
  // clipboard.writeImage(tempImg);

  // 清理选择和临时元素
  window.getSelection().removeAllRanges();
  document.body.removeChild(tempImg);

  console.log("图像元素已成功复制");
  // window.electron.sendMsg("图片已复制到粘贴板"); // 不需要返回值，不需要等promise
  window.electron.showMessage("success", "图片已复制到粘贴板"); // 不需要返回值，不需要等promise
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // 转义正则表达式中的特殊字符
}
// 图片模糊搜索（筛选功能）
function filterPictures(picList, userInput) {
  // 将 userInput 分割为字符，并对每个字符进行转义
  const escapedInput = userInput.split("").map(escapeRegExp).join("(.*?)");
  const regexPattern = "(.*?)" + escapedInput + "(.*?)"; // 使用 .*? 作为通配符
  //   console.log("regexPattern:", regexPattern);
  const regex = new RegExp(regexPattern, "i"); // 'i' 表示不区分大小写

  return picList.filter((pic) => {
    // 提取文件名（不带后缀）
    // const fileName = pic.split("/").pop();
    const fileName = pic.split("\\").pop();
    
    const lastDotIndex = fileName.lastIndexOf(".");
    const nameWithoutExtension =
      lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
    console.log("filterPictures loop:", fileName,lastDotIndex, nameWithoutExtension);
    // 测试文件名是否匹配正则
    return regex.test(nameWithoutExtension);
  });
}
// 加载RIR 的 JS文件
async function loadModuleVariable(url) {
    try {
        const module = await import(url);
        // 假设模块导出了 `someExportedVar`
        // console.log('see module', module);
        if (module.default) {
            return module.default;
        } else {
            throw new Error('模块未导出目标变量');
        }
    } catch (error) {
        console.error('加载模块失败:', error);
        return null;
    }
}