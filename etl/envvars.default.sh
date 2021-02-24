export PROJECT=ota_demo

export SPARK_CONF_DIR=${HOME}/spark-conf

export CONDA_HOME=${HOME}/miniconda3
export CONDA_SH=${CONDA_HOME}/etc/profile.d/conda.sh
export CONDA_ENV=${PROJECT}_conda_env
export CONDA_ENV_PATH=${CONDA_HOME}/envs/${CONDA_ENV}
export CONDA_PACK_FILE=${PROJECT}_env.tar.gz
export SUPPORT_FILE_DIR=${PROJECT}_support
export CONDA_PACK_PATH=${SUPPORT_FILE_DIR}/${CONDA_PACK_FILE}

export AWS_ACCESS_KEY=
export AWS_SECRET_KEY=