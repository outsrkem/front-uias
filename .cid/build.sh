#!/bin/bash
workspace=$(cd `dirname $0`/..; pwd)

SRC_DIR=${workspace}
NODE_IMG=node:20-alpine

app=uias
version=b0.0.0
release=b1

docker run --rm --net=host \
  -v "${SRC_DIR}:/app" \
  -v "${SRC_DIR}/node_modules:/app/node_modules" \
  -v /tmp/npm_cache:/root/.npm \
  -w /app \
  ${NODE_IMG} \
  sh -c "npm config set registry https://mirrors.huaweicloud.com/repository/npm/ &&\
  npm install --verbose --progress --no-audit --no-fund &&\
  npm run build"

if [ ! -d "${SRC_DIR}/dist" ]; then
  echo "ERROR: npm run build failed, dist directory not found!"
  exit 1
fi

product=${app}-${version}
tar zcvf "${product}.tar.gz" --transform "s/^dist/${product}/" dist

docker run --rm \
  -v "$(pwd)/.cid/uias.spec:/root/rpmbuild/SPECS/uias.spec" \
  -v "$(pwd)/${product}.tar.gz:/root/rpmbuild/SOURCES/${product}.tar.gz" \
  -v "$(pwd)/rpms:/root/rpmbuild/RPMS" \
  -w /root/rpmbuild \
  outsrkem/rpmbuild:4.14.3-rocky8 \
  bash -c "rpmbuild -bb \
  --define \"_version ${version}\" \
  --define \"_release ${release}\" \
  --define \"dist .el6\" \
  --define \"_packager LiHua\" \
  --define \"_email lark@email.com\" SPECS/uias.spec"

find . -name "${product}*.gz" -o -name "${product}*.rpm"
