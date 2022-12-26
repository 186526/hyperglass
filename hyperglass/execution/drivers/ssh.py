"""Common Classes or Utilities for SSH Drivers."""

# Standard Library
from typing import TYPE_CHECKING

# Project
from hyperglass.log import log
from hyperglass.state import use_state
from hyperglass.compat import BaseSSHTunnelForwarderError, open_tunnel
from hyperglass.exceptions.public import ScrapeError

# Local
from ._common import Connection

if TYPE_CHECKING:
    # Project
    from hyperglass.compat import SSHTunnelForwarder


class SSHConnection(Connection):
    """Base class for SSH drivers."""

    def setup_proxy(self) -> "SSHTunnelForwarder":
        """Return a preconfigured sshtunnel.SSHTunnelForwarder instance."""

        proxy = self.device.proxy
        params = use_state("params")

        def opener():
            """Set up an SSH tunnel according to a device's configuration."""
            tunnel_kwargs = {
                "ssh_username": proxy.credential.username,
                "remote_bind_address": (self.device._target, self.device.port),
                "local_bind_address": ("localhost", 0),
                "skip_tunnel_checkup": False,
                "gateway_timeout": params.request_timeout - 2,
            }
            if proxy.credential._method == "password":
                # Use password auth if no key is defined.
                tunnel_kwargs["ssh_password"] = proxy.credential.password.get_secret_value()
            else:
                # Otherwise, use key auth.
                tunnel_kwargs["ssh_pkey"] = proxy.credential.key.as_posix()
                if proxy.credential._method == "encrypted_key":
                    # If the key is encrypted, use the password field as the
                    # private key password.
                    tunnel_kwargs[
                        "ssh_private_key_password"
                    ] = proxy.credential.password.get_secret_value()
            try:
                return open_tunnel(proxy._target, proxy.port, **tunnel_kwargs)

            except BaseSSHTunnelForwarderError as scrape_proxy_error:
                log.error(
                    f"Error connecting to device {self.device.name} via " f"proxy {proxy.name}"
                )
                raise ScrapeError(
                    error=scrape_proxy_error, device=self.device
                ) from scrape_proxy_error

        return opener
