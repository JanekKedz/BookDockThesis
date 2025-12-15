#!/bin/bash
if [ -f "*.jar" ];
then
  rm ./*.jar
fi;

cp ../target/*.jar .