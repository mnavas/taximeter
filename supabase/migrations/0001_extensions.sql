-- 0001 — Extensions
-- PostGIS powers all geo work (availability counts, nearest, distance/ETA).
create extension if not exists postgis;
create extension if not exists pgcrypto;
