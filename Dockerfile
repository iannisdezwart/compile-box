############################################################
# Dockerfile to build sandbox for executing user code
# Based on Ubuntu
############################################################

FROM ubuntu:20.04

RUN apt-get update
RUN apt-get install -y apt-utils
RUN apt-get install -y sudo

# GNU C compiler
RUN apt-get install -y gcc

# GNU C++ compiler
RUN apt-get install -y g++

# PHP 8
RUN sudo apt-get install -y software-properties-common
RUN sudo add-apt-repository ppa:ondrej/php
RUN sudo apt-get update -y
RUN sudo apt-get install -y php8.0 libapache2-mod-php8.0

# Ruby
RUN apt-get install -y ruby

# Python 3
RUN apt-get install -y python3

# NodeJS
RUN apt-get install -y npm
RUN apt-get install -y nodejs
RUN export NODE_PATH=/usr/local/lib/node_modules/

# Golang
RUN apt-get install -y golang-go

# Java
RUN apt-get install -y wget
RUN wget https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_linux-x64_bin.tar.gz
RUN tar xvf openjdk-17.0.2_linux-x64_bin.tar.gz
RUN sudo mv jdk-17.0.2/ /java
ENV JAVA_HOME=/java

# Scala
RUN apt-get install -y scala

# Perl
RUN apt-get install -y perl

# Rust
RUN apt-get install -y curl
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH=$PATH:~/.cargo/bin
   # curl https://sh.rustup.rs -sSf | HOME=/opt/rust sh -s -- --no-modify-path -y && \
   # chmod -R 777 /opt/rust

# BC
RUN apt-get install -y bc