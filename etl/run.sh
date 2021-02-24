#!/bin/bash

cd $HOME/ota-demo/etl

# Activate env var
. envvars.default.sh
if [ -f envvars.sh ]; then
    . envvars.sh
fi

export SPARK_CONF_DIR=${HOME}/spark-conf

source ${CONDA_SH} && \
conda activate ${CONDA_ENV} && \
jupyter notebook
