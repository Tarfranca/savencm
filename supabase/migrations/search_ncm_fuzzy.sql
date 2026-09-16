-- Enable extensions
create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- GIN trigram index for fast fuzzy matching
create index if not exists idx_ncm_sh_descricao_trgm
  on ncm_sh using gin (descricao gin_trgm_ops);

-- Combined FTS + trigram fuzzy search function
-- Phase 1: full-text search (ts_rank, accent-insensitive via unaccent)
-- Phase 2: if FTS returned < 5 results, augment with word_similarity trigrams
create or replace function search_ncm(
  query_text    text,
  lim           int  default 20,
  off           int  default 0
)
returns table(
  codigo          text,
  descricao       text,
  ii_aliquota     numeric,
  ipi_aliquota    numeric,
  pis_aliquota    numeric,
  cofins_aliquota numeric,
  nesh_nota       text,
  ato_legal       text,
  match_type      text
)
language sql stable
set search_path = public
as $$
  with
    q as (
      select unaccent(lower(trim(query_text))) as v
    ),
    fts as (
      select
        n.codigo, n.descricao, n.ii_aliquota, n.ipi_aliquota,
        n.pis_aliquota, n.cofins_aliquota, n.nesh_nota, n.ato_legal,
        'fts'::text as match_type,
        ts_rank(
          to_tsvector('portuguese', unaccent(n.descricao)),
          websearch_to_tsquery('portuguese', (select v from q))
        ) as rnk
      from ncm_sh n
      where to_tsvector('portuguese', unaccent(n.descricao))
            @@ websearch_to_tsquery('portuguese', (select v from q))
    ),
    fts_count as (select count(*)::int as c from fts),
    trgm as (
      select
        n.codigo, n.descricao, n.ii_aliquota, n.ipi_aliquota,
        n.pis_aliquota, n.cofins_aliquota, n.nesh_nota, n.ato_legal,
        'trgm'::text as match_type,
        word_similarity((select v from q), unaccent(lower(n.descricao))) as rnk
      from ncm_sh n, fts_count fc
      where fc.c < 5
        and word_similarity((select v from q), unaccent(lower(n.descricao))) > 0.15
        and n.codigo not in (select codigo from fts)
      order by rnk desc
      limit lim
    ),
    merged as (
      select * from fts
      union all
      select * from trgm
    )
  select codigo, descricao, ii_aliquota, ipi_aliquota,
         pis_aliquota, cofins_aliquota, nesh_nota, ato_legal, match_type
  from merged
  order by
    case match_type when 'fts' then 0 else 1 end,
    rnk desc
  limit lim offset off
$$;
