# Pallet Town Hybrid 3D — protótipo modular v1

## Executar no Codespaces
Na pasta do projeto, rode:

```bash
python3 -m http.server 8000
```

Abra a porta 8000 no navegador.

## Controles
- Arrastar: girar a câmera.
- Pinça/rodinha: zoom.
- Toque/click na porta: entrar no interior.
- Botão “Voltar à cidade”: sair.
- “Câmera cinematográfica”: movimento automático.
- “Alternar horário”: alterna dia/noite.

## Observação sobre fidelidade
A planta usa como base o mapa de Pallet Town de FireRed: três construções principais, casas na porção norte, laboratório na porção sul/leste e conexões norte para Rota 1 e sul para Rota 21. As coordenadas atuais são uma primeira aproximação 3D e devem ser refinadas visualmente contra o mapa original antes de declarar fidelidade geométrica final.


## Ciclo de iluminação
O botão de horário alterna entre Dia, Tarde e Noite. No fim de tarde, o céu e a luz solar ficam mais quentes. À noite, as janelas emitem luz amarelada e os interiores recebem iluminação própria quando acessados.
