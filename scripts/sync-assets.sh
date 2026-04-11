#!/bin/bash
# Kopiuje assets projektów z content/projects/[slug]/assets/ do public/projects/[slug]/
# Uruchamiane automatycznie przed każdym buildem (prebuild w package.json)

CONTENT_DIR="$(dirname "$0")/../content/projects"
PUBLIC_DIR="$(dirname "$0")/../public/projects"

if [ ! -d "$CONTENT_DIR" ]; then
  echo "sync-assets: brak katalogu content/projects — pomijam"
  exit 0
fi

synced=0
for project_dir in "$CONTENT_DIR"/*/; do
  slug=$(basename "$project_dir")
  assets_src="$project_dir/assets"

  if [ ! -d "$assets_src" ]; then
    continue
  fi

  assets_dst="$PUBLIC_DIR/$slug"
  mkdir -p "$assets_dst"
  cp -r "$assets_src"/. "$assets_dst/"
  echo "sync-assets: [$slug] → public/projects/$slug/"
  synced=$((synced + 1))
done

if [ $synced -eq 0 ]; then
  echo "sync-assets: brak assets do skopiowania"
else
  echo "sync-assets: zsynchronizowano $synced projekt(ów)"
fi
