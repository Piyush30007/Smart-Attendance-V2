"""
Structured logging setup. Replaces scattered print() calls with
leveled, timestamped, JSON-friendly logs that a production log
aggregator (CloudWatch, Loki, etc.) can actually parse.
"""
import logging
import sys


def configure_logging(env: str = "development") -> None:
    log_format = (
        '{"time":"%(asctime)s","level":"%(levelname)s",'
        '"logger":"%(name)s","message":"%(message)s"}'
        if env == "production"
        else "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    )

    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[logging.StreamHandler(sys.stdout)],
    )

    # Quiet noisy third-party libs
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
