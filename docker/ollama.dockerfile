FROM ollama/ollama
RUN nohup bash -c "ollama serve &" && sleep 5 && ollama pull llama3
EXPOSE 11434
ENTRYPOINT ["/bin/ollama"]
CMD ["serve"]