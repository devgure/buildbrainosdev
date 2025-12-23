{{- define "buildbrain.name" -}}
{{- default .Chart.Name .Values.nameOverride -}}
{{- end -}}

{{- define "buildbrain.fullname" -}}
{{- printf "%s-%s" (include "buildbrain.name" .) .Release.Name -}}
{{- end -}}
