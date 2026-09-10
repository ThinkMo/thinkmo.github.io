+++
title = "python项目开发总结"
date = "2016-05-27T13:27:04+08:00"
url = "/2016/05/python项目开发总结/"
categories = []
clearReading = true
+++
<!-- Recovered article body from forfreedom a3ffc19; original Markdown was absent. -->

<div class="main-content-wrap">
<h3 id="python项目开发总结">python项目开发总结</h3>
<h4 id="编码规范flake8">编码规范flake8</h4>
<ul>
<li>
<p>安装 pip install flake8 或 brew install flake8</p>
</li>
<li>
<p>安装vim插件 <a href="https://github.com/scrooloose/syntastic">syntastic</a>，语法检测插件，很方便</p>
<pre><code>  由于使用vundle管理插件，只需在.vimrc中添加 Plugin 'scrooloose/syntastic' 
  打开vim，在命令行模式输入 PluginInstall
  最后在.vimrc中添加set lcs=extends:&gt;,precedes:&lt;,tab:&gt;-,trail:·
  vundle相关：https://github.com/VundleVim/Vundle.vim
</code></pre>
</li>
</ul>
<h4 id="使用virtualenv独立的开发环境">使用virtualenv，独立的开发环境</h4>
<pre><code>新建project 
virtualenv project
环境使能
cd project
source bin/activate
退出virtualenv环境
deactive
获得当前环境依赖
pip freeze
</code></pre>
<h4 id="python单例">python单例</h4>
<ul>
<li>
<p>metaclass元类就是用来创建这些类（对象）的，元类就是类的类,type就是Python的内建元类,用来创建类</p>
<pre><code>  1)   拦截类的创建

  2)   修改类

  3)   返回修改之后的类


  class Singleton(type):  ＃子类化type，__call__相当于重载了括号运算符
      _instances = {}
      def __call__(cls, *args, **kwargs):
          if cls not in cls._instances:
              cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
          return cls._instances[cls]

  class Logger(object):
      __metaclass__ = Singleton
  #Or in Python3

  class Logger(metaclass=Singleton):
      pass
  If you want to run __init__ every time the class is called, add

          else:
              cls._instances[cls].__init__(*args, **kwargs)
  to the if statement in Singleton.__call__.
</code></pre>
</li>
<li>
<p>继承</p>
<pre><code>  class Singleton(object):
      _instances = {}
      def __new__(class_, *args, **kwargs):
          if class_ not in class_._instances:
              class_._instances[class_] = super(Singleton, class_).__new__(class_, *args, **kwargs)
              class_._instances[class_].__init__()  # if you want init once
          return class_._instances[class_]

  class MyClass(Singleton):
      pass

  c = MyClass()
	
  最终采用了继承的方式，metaclass在测试时有问题
</code></pre>
</li>
</ul>
<h4 id="nosetest单元测试框架">nosetest单元测试框架</h4>
<pre><code>class A():
    def setUp(self):
        ....
	
    def tearDown(self):
        ....
		
    def testxxx(self):
        ....
		
每个test的运行顺序是  setUp-&gt;testxxx-&gt;tearDown-&gt;setUp-&gt;testxxx-&gt;....
</code></pre>
<h4 id="django发送内嵌图片的email">django发送内嵌图片的email</h4>
<pre><code># email_with_picture.html

{% for item in data %}
&lt;p&gt;item title&lt;/p&gt;
&lt;div&gt;
    &lt;img src="cid:{{item}}"/&gt;
&lt;/div&gt;
{% endfor %}

# python代码片段
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

subject = u"邮件title"
files = {'picturea': 'a.png', 'pictureb': 'b.png'}
render_data = files.keys()
html = render_to_string('email_with_picture.html', {"data": render_data})  # 渲染模版
msg = EmailMultiAlternatives(subject, html, 'tryit0714@gmail.com', ['a@126.com', 'b@yahoo.com'])
msg.content_subtype = 'html'
msg.mixed_subtype = 'related'
# 增加图片内容到邮件内容
for key, filename in files.iteritems():
    fp = open(filename, 'rb')
    msg_img = MIMEImage(fp.read())
    fp.close()
    content_id = u'&lt;{}&gt;'.format(key.name)
    msg_img.add_header('Content-ID', content_id.encode('utf8'))
    msg.attach(msg_img)
msg.send()
</code></pre>
</div>

