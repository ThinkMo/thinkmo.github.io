+++
keywords = ["transfromer"]
title = "图解transfromer(译)"
categories = ["llm"]
disqusIdentifier = "llm_transformer"
comments = true
clearReading = true
date = 2026-09-11T10:31:44+08:00 
showSocial = false
showPagination = true
showTags = true
showDate = true
+++

# 图解transformer(译)

> 本文翻译自 Jay Alammar 的[The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)

在之前的[博文](https://jalammar.github.io/visualizing-neural-machine-translation-mechanics-of-seq2seq-models-with-attention/)中我们阐述了注意力机制--一项被广泛应用于现代深度学习模型的技术。注意力机制可以有效提升机器翻译应用的性能。在本文中我们将介绍Transformer--该模型利用attention来加速模型训练。在处理某些任务方面Transformer表现优于google神经翻译模型，其最大优势在于支持并行处理。google cloud建议使用google tpu服务使用Transformer作为推理模型，让我们一起看下Transformer模型如何实现的。

在[Attention is All You Need](https://arxiv.org/abs/1706.03762)中首次提出Transformer，Harvard'NLP 用[Pytorch阐述并实现了Transformer](https://nlp.seas.harvard.edu/annotated-transformer/)，在本文中我们将对逐步介绍相关概念，简化内容，帮助无相关背景知识的人也能理解其原理。

## 总体概览

我们将Transformer模型当作黑盒来看，在机器翻译应用中，其接收某种语言的一个语句作为输入，输出对应的另一种语言对应结果。
![translation](https://jalammar.github.io/images/t/the_transformer_3.png)
深入Transformer内部，我们可以看到两个相连的组件，分别为encoding、decoding。
![encoders_decoders](https://jalammar.github.io/images/t/The_transformer_encoders_decoders.png)
encoding组件由一组encoders组成，同样的，decoding组件由同样数量decoders组成。
![encoder_decoder_stack](https://jalammar.github.io/images/t/The_transformer_encoder_decoder_stack.png)
所有encoders在架构上是一致的，当然不同encoders有着不同的权重参数，每一个encoder都可以拆分为两层(self-attention和FNN)：
![Transformer_encoder](https://jalammar.github.io/images/t/Transformer_encoder.png)
encoder的输入首先会经过自注意力层：该层会帮助encoder在编码某个单词的同时考虑输入句子中其他位置单词的含义。在后文中我们会详细阐述自注意力机制。

从自注意力层出来后会进入前向神经网络，句子中所有位置都会独立的经过相同的前向神经网络处理。

decoder同时包含以上两层，同时在两层之间还包含一层注意力层，帮助decoder专注于输入句子中相关的部分。
![Transformer_decoder](https://jalammar.github.io/images/t/Transformer_decoder.png)

## 了解向量

我们已经了解了Transformer的主要组件，现在来看下不同的向量/张量在组件中如何被处理，了解训练好的模型如何将输入转化为输出。

通常在自然语言处理中，我们会通过向量嵌入算法将输入的每一个词转化为向量。
![embeddings](https://jalammar.github.io/images/t/embeddings.png)

向量化处理仅发生在编码器的最底层，所有编码器都接收一个由多个向量组成的列表，每个向量的大小为512(可以理解为上下文窗口大小)。在最底层的编码器中，这些向量就是向量化词嵌入；而在其他编码器中，输入向量则是下方的编码器的输出结果。这个列表的大小是我们可以设置的超参数——实际上，它应该等于我们训练数据集中最长的句子的长度。

输入的句子会被转化为嵌入向量，并输入到编码器中，其中每个词都会经过编码器的两层结构。
![encoder_with_tensors](https://jalammar.github.io/images/t/encoder_with_tensors.png)

现在我们可以看到Transformer的一个关键特性：在自注意力层，句子中的每一个词会沿着自己所在位置被编码器进行处理，在注意力层它们之间的位置是相互依赖的；而在FNN中没有依赖关系，可以并行的处理。

接下来，我们会将示例简化为更短的句子，然后观察编码器的每个子层会发生什么情况。

## 编码

正如前文所述，编码器接收一个向量序列作为输入。这些向量先经过“自注意力”层，再经过前馈神经网络，处理后的结果随后向上传递给下一层编码器。
![encoder_with_tensors](https://jalammar.github.io/images/t/encoder_with_tensors_2.png)

如上图所示，每个位置上的词都会经过自注意力处理。随后，各个词对应的向量分别经过前馈神经网络——它们使用的是同一个网络，但每个向量都独立通过(并行处理)该网络。

### 自注意力概览

我一直把“自注意力”挂在嘴边，好像这是个人人都该熟悉的概念，但别被这种说法唬住了。我自己也是在阅读《Attention Is All You Need》这篇论文时，才第一次接触到这个概念。下面我们来抓住要点，看看它是如何工作的。

假设我们要翻译的输入句子如下：
> The animal didn't cross the street because it was too tired

句子中的“it”（它）指的是什么？是街道，还是那只动物？对人来说，这个问题很简单；对算法来说，却没那么容易。当模型处理“it”这个词时，自注意力机制使模型能够将“it”与“animal”（动物）联系起来。模型在处理每个词，也就是输入序列中的每个位置时，自注意力机制使它能够查看序列中的其他位置，从中寻找线索，从而为当前词生成更好的编码表示。

如果你熟悉循环神经网络（RNN），可以想一想：RNN 通过维护隐藏状态，将之前处理过的词或向量的表示，与当前正在处理的词或向量结合起来。而 Transformer 使用自注意力机制，将对其他相关词的“理解”融入当前词的表示中。
![transformer_self-attention_visualization](https://jalammar.github.io/images/t/transformer_self-attention_visualization.png)

*当我们在编号为 5 的编码器，也就是编码器堆栈最顶层的编码器中，对“it”进行编码时，注意力机制的一部分会关注“The Animal”，并将其部分表示融入“it”的编码中。*

可以通过 [Tensor2Tensor NoteBook](https://colab.research.google.com/github/tensorflow/tensor2tensor/blob/master/tensor2tensor/notebooks/hello_t2t.ipynb)，加载 Transformer 模型，并通过这种交互式可视化方式来观察模型。

### 自注意力详解

我们先看看如何用向量计算自注意力，再看看实际实现中如何用矩阵完成这些计算。

计算自注意力的**第一步**，是根据编码器的每个输入向量——在这里就是每个词的嵌入向量——生成三个向量。因此，对于每个词，我们都会生成一个查询向量（Query）、一个键向量（Key）和一个值向量（Value）。具体做法是：将该词的嵌入向量分别乘以三个权重矩阵；这些矩阵的参数是在训练过程中学到的。

注意，这些新向量的维度比嵌入向量小。它们的维度为 64，而嵌入向量以及编码器的输入、输出向量的维度都是 512。新向量的维度并非必须更小；这是一种架构设计选择，目的是让多头注意力的总计算量大体保持不变。

![image.png](assets/mtz9e0b8-image.png)

*将 \(x_1\) 乘以权重矩阵 \(W^Q\)，就会得到 \(q_1\)，即该词对应的“查询”向量。最终，我们会为输入句子中的每个词分别生成“查询”“键”和“值”三种投影表示。*

“查询”“键”和“值”向量究竟是什么？

它们是帮助我们计算和理解注意力的抽象概念。继续阅读下面的注意力计算过程后，你就能基本理解这些向量各自发挥的作用。

计算自注意力的**第二步**，是计算分数。假设我们正在为本例中的第一个词“Thinking”（思考）计算自注意力，就需要以这个词为参照，对输入句子中的每个词进行评分。这些分数决定了：在对某个位置的词进行编码时，应该对输入句子的其他部分投入多少注意力。

分数通过点积计算得到：将当前词的查询向量，与被评分词的键向量做点积。因此，如果我们正在计算第 1 个位置上的词的自注意力，那么第一个分数就是 \(q_1\) 与 \(k_1\) 的点积，第二个分数就是 \(q_1\) 与 \(k_2\) 的点积。

![image.png](assets/mtz9mspv-image.png)

**第三步和第四步是**：先将这些分数除以 8，再对结果进行 softmax 运算。这里的 8 是论文中键向量维度 64 的平方根，这样做**有助于使梯度更加稳定**。也可以采用其他缩放值，但这里默认使用这一数值。**Softmax 会将分数归一化**，使它们都为正数，并且总和为 1。

![image.png](assets/mtz9xp12-image.png)

经过 softmax 得到的分数，决定了各个词的信息会以多大的比重体现在当前位置的表示中。显然，当前位置上的词本身会获得最高的 softmax 分数(自注意力不保证当前词对自身的注意力权重最高，其他词完全可能获得更高权重)，但有时，关注另一个与当前词相关的词也很有帮助。

**第五步**，是将每个值向量乘以它对应的 softmax 分数，为后续求和做准备。直观上，这样做是为了尽可能保留我们想要关注的词所包含的信息，同时削弱无关词的信息——例如，将其乘以 0.001 这样很小的数。

**第六步**，是将这些加权后的值向量相加。所得结果就是自注意力层在当前位置，也就是第一个词所在位置的输出。

![image.png](assets/mtza0lc8-image.png)

至此，自注意力的计算就完成了。得到的向量可以继续传入前馈神经网络。不过，在实际实现中，为了提高处理速度，这些计算会以矩阵形式进行。现在我们已经从单个词的层面直观理解了计算过程，接下来就看看矩阵形式的计算。

### 自注意力中的矩阵计算

**第一步**是计算Query矩阵、Key矩阵和Value矩阵。我们先将各个词的嵌入向量排列成矩阵 \(X\)，再将 \(X\) 分别乘以训练得到的权重矩阵 \(W^Q\)、\(W^K\) 和 \(W^V\)。

![image.png](assets/mtza5sue-image.png)

*矩阵 \(X\) 中的每一行，都对应输入句子中的一个词。这里再次展示了嵌入向量与 q/k/v 向量在维度上的差异：前者为 512 维，在图中用 4 个方格示意；后者为 64 维，在图中用 3 个方格示意。*

最后，由于采用了矩阵形式，我们可以将第二步到第六步合并为一个公式，用来计算自注意力层的输出。

![image.png](assets/mtza7d8m-image.png)

### 多头机制

论文通过引入一种称为“多头注意力”的机制，进一步改进了自注意力层。这种机制从两个方面提升了注意力层的表现：

1. 它增强了模型关注不同位置的能力。在上面的例子中，\(z_1\) 确实包含了其他各个位置编码中的少量信息，但其中仍可能主要是当前词自身的信息。如果我们要翻译“The animal didn’t cross the street because it was too tired”（那只动物没有穿过街道，因为它太累了）这样的句子，知道“it”指代哪个词就会很有帮助。
2. 它为注意力层提供了多个“表示子空间”。接下来我们会看到，在多头注意力中，查询、键和值的权重矩阵不再只有一组，而是有多组。这里的 Transformer 使用 8 个注意力头，因此每个编码器或解码器中的相应注意力模块都有 8 组权重矩阵。每组矩阵都会随机初始化。训练完成后，各组矩阵分别用于将输入嵌入向量，或来自下层编码器、解码器的向量，投影到不同的表示子空间。

![image.png](assets/mtzacijz-image.png)

*在多头注意力中，每个注意力头都有各自独立的 Q/K/V 权重矩阵，因此会生成不同的 Q/K/V 矩阵。与前面一样，我们将 \(X\) 分别乘以 \(W^Q\)、\(W^K\) 和 \(W^V\)，得到 \(Q\)、\(K\) 和 \(V\)。*

如果使用不同的权重矩阵，将前面介绍的自注意力计算分别执行 8 次，就会得到 8 个不同的 \(Z\) 矩阵。

![image.png](assets/mtzaeqy8-image.png)

这就带来了一个小问题：前馈层需要的输入并不是 8 个矩阵，而是一个矩阵，其中每个词对应一个向量。因此，我们需要想办法将这 8 个矩阵合并成一个矩阵。

具体怎么做呢？先将这些矩阵拼接起来，再乘以一个额外的权重矩阵 \(W^O\)。

![image.png](assets/mtzaf05h-image.png)

多头自注意力的主要内容基本就是这些。我知道，这里面涉及的矩阵确实不少。下面我试着把它们放进同一张图中，方便我们集中查看。

![image.png](assets/mtzafjtt-image.png)

现在我们已经了解了注意力头，再回到前面的例句，看看在对“it”进行编码时，不同注意力头分别关注哪些地方：

![image.png](assets/mtzagocy-image.png)

*在对“it”进行编码时，一个注意力头主要关注“the animal”，另一个则主要关注“tired”（累的）。从某种意义上说，模型对“it”的表示，同时融入了“animal”和“tired”的部分表示信息。*

不过，如果把所有注意力头都加入图中，结果就会变得更难解读：

![image.png](assets/mtzahzb6-image.png)

### 位置编码

到目前为止，我们所描述的模型还缺少一种机制，用来表示输入序列中各个词的先后顺序。

为了解决这个问题，Transformer 会在每个输入嵌入向量上加上一个向量。这些附加向量遵循特定的模式，模型可以学习利用这种模式，判断每个词的位置，或者序列中不同词之间的距离。直观地说，将这些数值加入嵌入向量后，当嵌入向量被投影为 Q/K/V 向量并参与点积注意力计算时，模型就能够利用其中蕴含的位置信息.

![image.png](assets/mtzajq3d-image.png)

*为了让模型感知词的顺序，我们加入了位置编码向量，这些向量中的数值遵循特定的模式。*

假设嵌入向量的维度为 4，那么实际的位置编码会如下所示：

![image.png](assets/mtzam2qp-image.png)

*一个实际的位置编码示例，为便于演示，将嵌入维度设为 4。*

这种模式具体是什么样的呢？

在下图中，每一行都对应一个位置编码向量。因此，第一行就是要加到输入序列中第一个词的嵌入向量上的向量。每行包含 512 个数值，每个数值都介于 −1 和 1 之间。我们用颜色表示这些数值，以便直观地观察它们的模式。

![image.png](assets/mtzaopgm-image.png)

*这是一个实际的位置编码示例，包含 20 个词的位置（行），嵌入维度为 512（列）。可以看到，图像似乎从中间分成了左右两半。这是因为左半部分的数值由一个使用正弦的函数生成，右半部分则由另一个使用余弦的函数生成。随后，将这两部分拼接起来，形成每个位置的位置编码向量。*

论文第 3.5 节给出了位置编码的公式。你可以在 [get_timing_signal_1d()](https://github.com/tensorflow/tensor2tensor/blob/23bd23b9830059fbc349381b70d9429b5c40a139/tensor2tensor/layers/common_attention.py) 中查看生成位置编码的代码。这并不是位置编码的唯一实现方式，但它有一个优点：能够扩展到训练时未见过的序列长度。例如，我们可能会让训练好的模型翻译一个句子，而它比训练集中的任何句子都长。

2020 年 7 月更新：上面展示的位置编码来自 Tensor2Tensor 对 Transformer 的实现。论文中的方法略有不同：它不是直接拼接这两种信号，而是将它们交错排列。下图展示了这种排列方式，并附有生成它的代码：

![image.png](assets/mtzargur-image.png)


### 残差连接

## 解码

## 线性

## 总结

## Q & A