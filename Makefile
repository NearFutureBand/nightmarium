server-container:
	docker run --name nightmarium -d -p 192.168.100.5:9000:9000 nightmarium-server
run-server:
	docker start nightmarium