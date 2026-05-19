#!/bin/bash

screen -S pharm-backend -X quit 2>/dev/null
screen -S pharm-tablet -X quit 2>/dev/null
screen -S pharm-doctor -X quit 2>/dev/null
screen -S pharm-admin -X quit 2>/dev/null

echo "All app screens stopped."
screen -ls
