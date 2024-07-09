/**
 *  第一步：处理账号是否登录的情况，未登录跳转到登录页面
 *  第二步：登录成功之后，给用户头像下面添加名称和昵称-设置用户信息
 *  第三步：点击右上角×，注销账号
 *  第四步：封装发送信息函数+格式化时间戳函数
 *  第五步：封装一个添加消息的函数
 *  第六步：封装一个发送消息的函数
 *  第七步：将事件跟函数进行连接
 */
(async function () {
    // 拿到所需要的dom元素
    const doms = {
        aside: {
            loginId: $('#loginId'),
            nickName: $('#nickname'),
        },
        close: $('.close'),
        chatContainer: $('.chat-container'),
        txtInput: $('#txtMsg'),
        form: $('.msg-container'),
    }

    // 第一步：验证账号是否已经登录，如果没有登录则跳转到登录页面，如果有登录获取到用户信息
    const resp = await API.profile();
    const user = resp.data; // 拿到用户信息，后续可以继续使用
    if (!user) {
        alert(`未登录或登录已过期，请重新登录`);
        location.href = './login.html';
        return;
    }
    // 上面是解决没有登录或者登录过期的情况
    // 下面是登录成功或在登录有效期内的情况

    // 第二步，设置用户信息
    setUserInfo();

    // 第三步：给右上角✖️注册点击事，点击之后注销账号
    doms.close.addEventListener('click', () => {
        API.loginOut();
        location.href = './login.html';
    })

    // 加载历史聊天记录
    await loadHistory();
    async function loadHistory() {
        const resp = await API.getHistory();
        for (const item of resp.data) {
            addChat(item);
        }
    }

    // 发送消息事件
    doms.form.addEventListener('submit', (e) => {
        e.preventDefault();
        sendChat();
        doms.txtInput.value = '';
    })



    // 一开始滚动条是滚动到最下方的
    function setScroll() {
        // 将滚动条的高度设置为 滚动条的最大高度，也就是直接设置滚动条到底部；
        doms.chatContainer.scrollTop = doms.chatContainer.scrollHeight;
    }
    setScroll();

    // 封装一个发送聊天信息的函数
    async function sendChat() {
        // 拿到消息文本框的内容之后，调用addChat函数
        const content = doms.txtInput.value.trim();
        if (!content) {
            return;
        }

        // 要最开始先将用户的信息添加到页面上，然后再发送网络请求，增加用户体验
        addChat({
            content,
            createdAt: Date.now(),
            from: user.loginId, // 人发送给机器人
            to: null,
        })
        setScroll();
        // 然后再发送网络请求
        const resp = await API.sendChat(content);

        addChat({
            from: null, // 机器人发送给人
            to: user.loginId,
            ...resp.data,
        })
        setScroll();
    }


    // 设置用户头像下面的用户名和昵称
    function setUserInfo() {
        // 必须使用innertext，而不能是innerHTML，因为它会编码显示
        // 任何时候不能信任用户给我们提交的信息内容-注入攻击
        doms.aside.loginId.innerText = user.loginId;
        doms.aside.nickName.innerText = user.nickname;
    }

    // 获取历史聊天记录
    // 封装一个添加聊天记录的方法
    /**
     * 拿到聊天内容，创建元素，添加到容器中
     * @param {*} chatInfo 
     */
    function addChat(chatInfo) {

        const itemDiv = $$$('div');
        itemDiv.classList.add('chat-item');
        if (chatInfo.from) {
            itemDiv.classList.add('me');
        }

        const img = $$$('img');
        img.className = 'chat-avatar';
        img.src = chatInfo.from ? './asset/avatar.png' : './asset/robot-avatar.jpg';

        const contentDiv = $$$('div');
        contentDiv.classList.add('chat-content');
        contentDiv.innerText = chatInfo.content;

        const dateDiv = $$$('div');
        dateDiv.classList.add('chat-date');
        dateDiv.innerText = formateTime(chatInfo.createdAt);

        itemDiv.appendChild(img);
        itemDiv.appendChild(contentDiv);
        itemDiv.appendChild(dateDiv);

        doms.chatContainer.appendChild(itemDiv);
    }

    // 封装一个将时间戳格式化的函数
    function formateTime(timestamp) {
        const data = new Date(timestamp);
        const year = data.getFullYear();
        const month = (data.getMonth() + 1).toString().padStart('2', '0');
        const day = data.getDate().toString().padStart('2', '0');
        const hour = data.getHours().toString().padStart('2', '0');
        const minute = data.getMinutes().toString().padStart('2', '0');
        const second = data.getSeconds().toString().padStart('2', '0');

        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }

    // addChat({
    //     content: "my name is  qiaqi",
    //     createdAt: 1652347192389,
    //     from: "haha",
    //     to: null,
    // })














})();



























