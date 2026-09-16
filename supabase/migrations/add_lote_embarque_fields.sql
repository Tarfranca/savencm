-- Adiciona campos de embarque à tabela lotes
-- Esses campos são extraídos pela IA a partir do conteúdo de cada invoice

ALTER TABLE lotes
  ADD COLUMN IF NOT EXISTS moeda_origem text,
  ADD COLUMN IF NOT EXISTS estado_desembaraco text;

-- Remove campos de embarque do perfil_fiscal (agora vêm de cada lote)
ALTER TABLE perfil_fiscal
  DROP COLUMN IF EXISTS estado,
  DROP COLUMN IF EXISTS modal,
  DROP COLUMN IF EXISTS moeda;

-- Adiciona regimes_especiais ao perfil_fiscal
ALTER TABLE perfil_fiscal
  ADD COLUMN IF NOT EXISTS regimes_especiais text[] DEFAULT '{}';
