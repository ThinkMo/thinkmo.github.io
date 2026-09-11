+++
keywords = ["transfromer"]
title = "图解transfromer(译)"
categories = ["llm"]
disqusIdentifier = “llm_transformer"
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

### 自注意力概览

### 自注意力详解

### 自注意力中的矩阵计算

### 多头机制

### 位置编码

### 残差连接

## 解码

## 线性

## 总结

## Q & A