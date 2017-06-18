# sina weibo

## login

1. weibo
  ```
  uri: http://login.sina.com.cn/sso/login.php?client=ssologin.js(v1.4.18),
  method: post,
  form: entry=weibo&gateway=1&from=&savestate=7&useticket=1&pagerefer=&vsnf=1&su=OTE2OTQ2OTEyJTQwcXEuY29t&service=miniblog&servertime=1497797903&nonce=0R26NV&pwencode=rsa2&rsakv=1330428213&sp=074d0af3e0961b56c88351d113e6ca13af05650d842a2fc5b085a5c14d873ef58ee23c7aa260328d5afaa2d4949cf9b77f8ade4366c6d3a6ebdcce8b07a792cbb3feaca019862bb2d51e03df9c94b55694e988e9d29620934c6b649183456f733a892f2afda16fa3e0486066f986e8c2e507605a68fe7c47f00baeb8a07b4893&sr=1920*1080&encoding=UTF-8&prelt=91&url=http%3A%2F%2Fweibo.com%2Fajaxlogin.php%3Fframelogin%3D1%26callback%3Dparent.sinaSSOController.feedBackUrlCallBack&returntype=META,

    entry:weibo
    gateway:1
    from:
    savestate:7
    useticket:1
    pagerefer:
    vsnf:1
    su:OTE2OTQ2OTEyJTQwcXEuY29t
    service:miniblog
    servertime:1497797903
    nonce:0R26NV
    pwencode:rsa2
    rsakv:1330428213
    sp:074d0af3e0961b56c88351d113e6ca13af05650d842a2fc5b085a5c14d873ef58ee23c7aa260328d5afaa2d4949cf9b77f8ade4366c6d3a6ebdcce8b07a792cbb3feaca019862bb2d51e03df9c94b55694e988e9d29620934c6b649183456f733a892f2afda16fa3e0486066f986e8c2e507605a68fe7c47f00baeb8a07b4893
    sr:1920*1080
    encoding:UTF-8
    prelt:91
    url:http://weibo.com/ajaxlogin.php?framelogin=1&callback=parent.sinaSSOController.feedBackUrlCallBack
    returntype:META

  entry:weibo
  gateway:1
  from:
  savestate:7
  useticket:1
  pagerefer:http://login.sina.com.cn/sso/logout.php?entry=miniblog&r=http%3A%2F%2Fweibo.com%2Flogout.php%3Fbackurl%3D%252F
  vsnf:1
  su:dW5kZWZpbmVk
  service:miniblog
  servertime:1497798298
  nonce:5VYBNK
  pwencode:rsa2
  rsakv:1330428213
  sp:c6c72ae438f5cf7b9a17c2b5c9f4e68acb59b7034599143f239395f0abad7adf72d72b563b0b28197af83b233f36a0af7c25c312efa12a944fa011cc112cf84e9b8ed03f7552bcf683c7df0828e2e295ecfdf3649ce796b2f4e4aa5a3d3b65d9d920f02249640e5fab32b7d23853f6733d6bf7a62f8606cfaa4f16599aad7a25
  sr:1920*1080
  encoding:UTF-8
  prelt:530
  url:http://weibo.com/ajaxlogin.php?framelogin=1&callback=parent.sinaSSOController.feedBackUrlCallBack
  returntype:META
  ```

## error

1. statusCode = 514

2. message = 'Error: ESOCKETTIMEDOUT'
  
